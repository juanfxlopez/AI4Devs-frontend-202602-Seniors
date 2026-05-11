module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Avoid running stale copies of tests emitted under dist/ by tsc.
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  };