// See: https://jestjs.io/docs/configuration

/** @type {import('jest').Config} */
const jestConfig = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  // Uncomment the below lines if you would like to enforce a coverage threshold
  // for your action. This will fail the build if the coverage is below the
  // specified thresholds.
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100
  //   }
  // },
  moduleFileExtensions: ['js'],
  reporters: ['default'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  verbose: true
}

export default jestConfig
