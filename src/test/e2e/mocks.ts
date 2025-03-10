import { vi } from 'vitest'

export const mockEmails = [
  {
    id: 'email1',
    sender: 'sender1@example.com',
    subject: 'Test Email 1',
    preview: 'This is test email 1',
    created_at: '2023-01-01T00:00:00Z',
    identity_id: 'identity1',
    gmail_id: 'gmail1',
    categories: ['category1']
  },
  {
    id: 'email2',
    sender: 'sender2@example.com',
    subject: 'Test Email 2',
    preview: 'This is test email 2',
    created_at: '2023-01-02T00:00:00Z',
    identity_id: 'identity2',
    gmail_id: 'gmail2',
    categories: ['category2']
  }
]

export const mockCategories = [
  {
    id: 'category1',
    name: 'Work',
    description: 'Work related emails',
    icon: 'briefcase',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'category2',
    name: 'Personal',
    description: 'Personal emails',
    icon: 'user',
    created_at: '2023-01-02T00:00:00Z'
  }
]

export const mockAccounts = [
  {
    id: 'user1',
    email: 'user1@example.com',
    name: 'Test User 1',
    avatar_url: 'https://example.com/avatar1.png'
  }
]

// Setup store mocks for tests
export function setupStoreMocks() {
  // Mock the email store
  vi.mock('~/components/stores/email_store', () => ({
    useEmailStore: () => ({
      emails: mockEmails,
      selectedEmails: [],
      toggleEmailSelection: vi.fn(),
      setFilters: vi.fn(),
      isLoading: false
    })
  }))

  // Mock the category store
  vi.mock('~/components/stores/category_store', () => ({
    useCategoryStore: () => ({
      categories: mockCategories,
      activeCategory: null,
      setActiveCategory: vi.fn(),
      addCategory: vi.fn(),
      removeCategory: vi.fn(),
      updateCategory: vi.fn()
    })
  }))

  // Mock the account store
  vi.mock('~/components/stores/account_store', () => ({
    useAccountStore: () => ({
      accounts: mockAccounts,
      activeAccount: mockAccounts[0],
      setActiveAccount: vi.fn(),
      isLoading: false
    })
  }))

  // Mock the initialize function
  vi.mock('~/components/stores/initialize', () => ({
    initializeStores: () => () => {}
  }))

  // Mock supabase client
  vi.mock('~/lib/supabase/client', () => ({
    createClient: () => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user1', email: 'user1@example.com' } }
        }),
        signInWithOAuth: vi.fn()
      }
    })
  }))
}