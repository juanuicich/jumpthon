import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// Mock window properties that are not available in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Set up default window properties
Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 })
Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 })

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})