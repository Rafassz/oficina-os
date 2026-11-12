module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/application/**/use-cases/**/*.ts',
    '!src/**/index.ts',
    '!src/**/setupController.ts',
  ],
  coverageDirectory: 'coverage',
}
