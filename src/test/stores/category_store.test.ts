import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCategoryStore } from '~/components/stores/category_store'

// Mock the Supabase client
vi.mock('~/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          data: mockCategories,
          error: null
        })
      })
    })
  })
}))

// Mock category data
const mockCategories = [
  {
    id: '1',
    name: 'Work',
    description: 'Work related emails',
    color: '#ff0000',
    icon: 'briefcase',
    user_id: 'user123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: null
  },
  {
    id: '2',
    name: 'Personal',
    description: 'Personal emails',
    color: '#00ff00',
    icon: 'user',
    user_id: 'user123',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: null
  }
]

describe('Category Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useCategoryStore.getState()
    store.categories = []
    store.activeCategory = null
  })

  it('should initialize with empty categories and null activeCategory', () => {
    const state = useCategoryStore.getState()
    expect(state.categories).toEqual([])
    expect(state.activeCategory).toBeNull()
  })

  it('should fetch categories from the API', async () => {
    const { fetchCategories } = useCategoryStore.getState()
    await fetchCategories()

    const updatedState = useCategoryStore.getState()
    expect(updatedState.categories).toEqual(mockCategories)
  })

  it('should set the active category', () => {
    const { setActiveCategory } = useCategoryStore.getState()
    const category = mockCategories[0]
    
    setActiveCategory(category)
    
    const updatedState = useCategoryStore.getState()
    expect(updatedState.activeCategory).toEqual(category)
  })

  it('should set active category to null', () => {
    const { setActiveCategory } = useCategoryStore.getState()
    
    // First set a category
    setActiveCategory(mockCategories[0])
    
    // Then set to null
    setActiveCategory(null)
    
    const updatedState = useCategoryStore.getState()
    expect(updatedState.activeCategory).toBeNull()
  })
})