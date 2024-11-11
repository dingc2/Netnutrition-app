// test/__mocks__/firebase.js

const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null); // Always return null user
    return () => {}; // Return unsubscribe function
  })
};

export { auth };

export default {
  auth,
  name: '[DEFAULT]',
  options: {},
};