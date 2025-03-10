import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/e2e/setup.ts'],
    include: [
      './src/test/e2e/**/*.test.{ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**'
    ],
    logHeapUsage: false,
    silent: false,
    reporters: ['default'],
    onConsoleLog: (log) => {
      // Filter out React key warnings
      if (log.includes('key prop') || log.includes('Duplicate atom key')) {
        return false
      }
      return true
    }
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
})