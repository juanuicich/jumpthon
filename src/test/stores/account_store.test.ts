import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAccountStore } from '~/components/stores/account_store'
import { createClient } from '~/lib/supabase/client'

// Mock Supabase client
vi.mock('~/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          data: mockAccounts,
          error: null
        })
      })
    })
  })
}))

// Mock account data
const mockAccounts = [
  {
    id: 'account-1',
    identity_id: 'identity-1',
    name: 'Test User 1',
    email: 'test1@example.com',
    picture_url: 'https://example.com/picture1.jpg',
    access_token: 'access-token-1',
    refresh_token: 'refresh-token-1',
    user_id: 'user-123',
    provider_id: 'google-oauth2'
  },
  {
    id: 'account-2',
    identity_id: 'identity-2',
    name: 'Test User 2',
    email: 'test2@example.com',
    picture_url: 'https://example.com/picture2.jpg',
    access_token: 'access-token-2',
    refresh_token: 'refresh-token-2',
    user_id: 'user-123',
    provider_id: 'google-oauth2'
  }
]

describe('Account Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useAccountStore.getState()
    store.accounts = []
    store.activeAccount = null
    store.isLoading = false
    store.error = null
  })

  it('should initialize with default values', () => {
    const state = useAccountStore.getState()
    expect(state.accounts).toEqual([])
    expect(state.activeAccount).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })


  it('should set active account', async () => {
    const { fetchAccounts, setActiveAccount } = useAccountStore.getState()

    // First fetch accounts
    await fetchAccounts()

    // Set active account
    setActiveAccount(mockAccounts[1])

    // Verify active account
    const state = useAccountStore.getState()
    expect(state.activeAccount).toEqual(mockAccounts[1])
  })

  it('should clear active account when setting to null', () => {
    const { setActiveAccount } = useAccountStore.getState()

    // Set active account to null
    setActiveAccount(null)

    // Verify active account is null
    const state = useAccountStore.getState()
    expect(state.activeAccount).toBeNull()
  })
})