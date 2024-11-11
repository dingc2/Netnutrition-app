// __mocks__/firebase/auth.js
export const getReactNativePersistence = jest.fn(() => ({}));
export const initializeAuth = jest.fn(() => ({
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const updateProfile = jest.fn();