import { config } from 'dotenv'
import { configDefaults, defineConfig } from 'vitest/config'

config({ path: '.env.test' })

const integration = process.env.VITEST_INTEGRATION === '1'

export default defineConfig({
  test: {
    environment: 'node',
    include: integration
      ? ['src/**/*.integration.test.ts']
      : ['src/**/*.test.ts'],
    // Extend Vitest's default excludes (node_modules, dist, …) rather than
    // replacing them; unit mode additionally excludes the integration file.
    exclude: integration
      ? configDefaults.exclude
      : [...configDefaults.exclude, '**/*.integration.test.ts'],
  },
})
