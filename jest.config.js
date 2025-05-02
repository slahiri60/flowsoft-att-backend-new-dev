module.exports = {
  // Preserve your existing Jest configuration
  testEnvironment: 'node',

  // Update coverage path ignore patterns to include api-tests
  coveragePathIgnorePatterns: ['/node_modules/', '/_tests_/api-tests/'],

  // Keep your existing test match patterns
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Add the test path ignore patterns to skip api-tests
  testPathIgnorePatterns: ['/node_modules/', '/_tests_/api-tests/'],
};
