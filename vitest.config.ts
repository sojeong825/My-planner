import { config } from 'dotenv'
import { defineConfig } from 'vitest/config'

config({ path: '.env.test' })

const integration = process.env.VITEST_INTEGRATION === '1'

export default defineConfig({
  test: {
    environment: 'node',
    include: integration
      ? ['src/**/*.integration.test.ts']
      : ['src/**/*.test.ts'],
    exclude: integration ? [] : ['**/node_modules/**', '**/*.integration.test.ts'],
  },
})
