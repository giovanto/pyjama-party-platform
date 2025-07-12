import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.test.{ts,tsx}',
      'tests/**/test.{ts,tsx}',
      'src/**/*.test.{ts,tsx}'
    ],
    exclude: [
      'tests/e2e/**',
      'tests/**/*.spec.ts',
      'tests/api-integration.test.js',
      'tests/supabase-integration.test.js',
      'node_modules/**',
      'dist/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})