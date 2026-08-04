/**
 * Domain-layer tests run in a plain Node environment — the Domain layer is
 * pure TypeScript with no React Native imports, which is exactly what makes it
 * cheap to test exhaustively (docs/standards/Testing-Strategy.md).
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
