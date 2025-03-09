import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEmailStore } from '~/components/stores/email_store'

// Mock lodash.debounce to immediately execute the function
vi.mock('lodash.debounce', () => ({
  default: (fn) => fn
}))

// Mock the Supabase client
vi.mock('~/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => ({
            eq: () => ({
              eq: () => ({
                data: mockEmails,
                error: null
              }),
              data: mockEmails,
              error: null
            }),
            data: mockEmails,
            error: null
          })
        })
      })
    })
  })
}))

// Mock email data
const mockEmails = [
  {
    id: 'email1',
    sender: 'sender1@example.com',
    subject: 'Test Email 1',
    preview: 'This is test email 1',
    created_at: '2023-01-01T00:00:00Z',
    category_id: 'category1',
    identity_id: 'identity1',
    gmail_id: 'gmail1'
  },
  {
    id: 'email2',
    sender: 'sender2@example.com',
    subject: 'Test Email 2',
    preview: 'This is test email 2',
    created_at: '2023-01-02T00:00:00Z',
    category_id: 'category2',
    identity_id: 'identity2',
    gmail_id: 'gmail2'
  }
]

// Mock category
const mockCategory = {
  id: 'category1',
  name: 'Work',
  description: 'Work related emails',
  color: '#ff0000',
  icon: 'briefcase',
  user_id: 'user123',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: null
}

// Mock account
const mockAccount = {
  id: 'account1',
  identity_id: 'identity1',
  name: 'Test User',
  email: 'test@example.com',
  picture_url: 'https://example.com/picture.jpg',
  access_token: 'access_token',
  refresh_token: 'refresh_token',
  user_id: 'user123'
}

describe('Email Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useEmailStore.getState()
    store.emails = []
    store.selectedEmails = []
    store.isLoading = true
    store.error = null
    store.filters = {}
  })

  it('should initialize with default values', () => {
    const state = useEmailStore.getState()
    expect(state.emails).toEqual([])
    expect(state.selectedEmails).toEqual([])
    expect(state.isLoading).toBe(true)
    expect(state.error).toBeNull()
    expect(state.filters).toEqual({})
  })

  it('should set filters and fetch emails', async () => {
    const { setFilters, emails } = useEmailStore.getState()
    
    // Set category filter and triggers fetch
    await setFilters({ category: mockCategory })
    
    const updatedState = useEmailStore.getState()
    expect(updatedState.filters.category).toEqual(mockCategory)
    expect(updatedState.emails).toEqual(mockEmails)
  })

  it('should toggle email selection', () => {
    const { toggleEmailSelection, selectedEmails } = useEmailStore.getState()
    
    // Select an email
    toggleEmailSelection('email1')
    
    let state = useEmailStore.getState()
    expect(state.selectedEmails).toContain('email1')
    
    // Deselect the email
    toggleEmailSelection('email1')
    
    state = useEmailStore.getState()
    expect(state.selectedEmails).not.toContain('email1')
  })

  it('should select all emails', async () => {
    const { fetchEmails, selectAllEmails } = useEmailStore.getState()
    
    // First fetch emails
    await fetchEmails()
    
    // Then select all
    selectAllEmails()
    
    const state = useEmailStore.getState()
    expect(state.selectedEmails).toHaveLength(mockEmails.length)
    expect(state.selectedEmails).toContain('email1')
    expect(state.selectedEmails).toContain('email2')
  })

  it('should clear selected emails', () => {
    const { toggleEmailSelection, clearSelectedEmails } = useEmailStore.getState()
    
    // First select some emails
    toggleEmailSelection('email1')
    toggleEmailSelection('email2')
    
    // Then clear selections
    clearSelectedEmails()
    
    const state = useEmailStore.getState()
    expect(state.selectedEmails).toHaveLength(0)
  })
})