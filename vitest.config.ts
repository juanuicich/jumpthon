import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      './src/test/**/*.test.{ts,tsx}',
      './src/test/e2e/**/*.test.{ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**'
    ]
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
})