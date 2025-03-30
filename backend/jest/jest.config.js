/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(mime|@aws-sdk))',
  ],
  moduleNameMapper: {
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@routeParams/(.*)$": "<rootDir>/src/routeParams/$1",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.ts",
    "<rootDir>/src/**/*.{spec,test}.ts"
  ],
};