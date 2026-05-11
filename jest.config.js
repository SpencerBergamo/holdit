module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/convex/__tests__/**/*.[jt]s?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/convex/_generated/'],
  collectCoverageFrom: [
    'convex/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!convex/_generated/**',
  ],
};
