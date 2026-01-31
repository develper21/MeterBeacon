const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/$1',
    // Handle CSS imports
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': 'jest-css-modules',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '!**/__tests__/jest.setup.ts',
    '!**/__tests__/components/Sidebar.test.tsx',
    '!**/__tests__/app/page.test.tsx'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests-e2e/',
    '<rootDir>/node_modules/',
    '<rootDir>/.next/'
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests-e2e/**',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
