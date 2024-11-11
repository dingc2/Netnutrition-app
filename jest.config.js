// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@env$': '<rootDir>/test/mocks/env.js',
    '^react-native-vector-icons/FontAwesome$': '<rootDir>/__mocks__/react-native-vector-icons/FontAwesome.js',
    '^firebase/app$': '<rootDir>/__mocks__/firebase.js',
    '^firebase/auth$': '<rootDir>/__mocks__/firebase.js'
  },
  moduleDirectories: ['node_modules', '__mocks__', '<rootDir>'],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js']
};