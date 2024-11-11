// jest.setup.js
import '@testing-library/jest-native';

global.setImmediate = jest.fn((callback) => callback());

// Mock React Native
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock vector icons
jest.mock('react-native-vector-icons/FontAwesome', () => {
  return function MockIcon({ name, size, color, style }) {
    return {
      $$typeof: Symbol.for('react.element'),
      type: 'Text',
      props: {
        testID: `mock-icon-${name}`,
        style: [{ fontSize: size, color }, style],
        children: name
      }
    };
  };
});

// Mock environment variables
jest.mock('@env', () => ({
  F_API: 'test-api-key',
  F_AUTH: 'test-auth-domain',
  F_PROJECTID: 'test-project-id',
  F_STORAGEBUCKET: 'test-storage-bucket',
  F_MESSAGINGID: 'test-messaging-id',
  F_APPID: 'test-app-id',
  F_MEASUREMENTID: 'test-measurement-id',
  DB_DOMAIN: 'test-domain'
}));