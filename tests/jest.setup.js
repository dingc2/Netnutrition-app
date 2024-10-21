// Import required testing utilities
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocking
fetchMock.enableMocks();

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock native modules and components
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock react-native components that might cause issues
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.NativeModules.PlatformConstants = {
    forceTouchAvailable: false,
  };
  
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: () => null,
    },
    NativeModules: {
      ...RN.NativeModules,
      RNGestureHandlerModule: {
        attachGestureHandler: jest.fn(),
        createGestureHandler: jest.fn(),
        dropGestureHandler: jest.fn(),
        updateGestureHandler: jest.fn(),
        State: {},
        Directions: {},
      },
    },
    UIManager: {
      ...RN.UIManager,
      RCTView: {
        directEventTypes: {},
      },
    },
    
    ActivityIndicator: 'ActivityIndicator',
    FlatList: 'FlatList',
    Modal: 'Modal',
    ScrollView: 'ScrollView',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock firebase
jest.mock('../firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {
        hallId: '1',
        hallName: 'Test Hall',
      },
    }),
  };
});

// Add test IDs to components for easier testing
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  const { TouchableHighlight } = require('react-native');
  const MockTouchable = (props) => {
    return <TouchableHighlight {...props} testID={props.testID || 'touchable'} />;
  };
  MockTouchable.displayName = 'TouchableOpacity';
  return MockTouchable;
});

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve()),
}));

// Setup console mocks to clean up test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Error: Uncaught [Error: expected]') ||
    args[0].includes('Error: expect')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args) => {
  if (
    args[0].includes('componentWillReceiveProps') ||
    args[0].includes('componentWillMount')
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Global test timeouts
jest.setTimeout(10000);

// Mock timers
jest.useFakeTimers();

// Add custom matchers
expect.extend({
  toBeVisible(received) {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () => `expected ${received} to be visible`,
    };
  },
});

// Setup global beforeEach and afterEach hooks
beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});