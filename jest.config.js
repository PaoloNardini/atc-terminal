module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}
